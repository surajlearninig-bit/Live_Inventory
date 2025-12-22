from flask import Flask, request, jsonify, render_template, redirect, session, url_for
import sqlite3, json
from datetime import datetime
from functools import wraps
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import csv, io
import os

app = Flask(__name__)
app.secret_key = os.environ.get("APP_SECRET_KEY" ,"inventory-secret-key")
# 1. Environment se path uthao
DB_PATH = os.environ.get("DB_PATH", "database.db")

# 2. Folder create karo (agar zaroorat ho)
if os.path.dirname(DB_PATH):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# 3. Connection ke liye variable set karo
DB = DB_PATH

# ---------------- USERS (TEMP) ----------------
USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "viewer": {"password": "viewer123", "role": "viewer"},
    "suraj": {"password": "suraj123", "role": "viewer"}
}

def db():
    return sqlite3.connect(DB)

# ---------------- AUTH HELPERS ----------------
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            return redirect("/login")
        return f(*args, **kwargs)
    return wrapper

def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if session.get("role") != role:
                return "Access Denied", 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ================= AUTH =================
@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]

        if u in USERS and USERS[u]["password"] == p:
            session["user"] = u
            session["role"] = USERS[u]["role"]
            return redirect("/")
        return render_template("login.html", error="Invalid login")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# ================= INIT =================
@app.route("/init")
def init_db():
    con = db()
    cur = con.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS live_inventory(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_name TEXT UNIQUE,
        last_seen TEXT,
        data TEXT
    )
    """)
    con.commit()
    con.close()
    return "DB Ready"

# ================= PAGES =================
@app.route("/")
@login_required
def home():
    return render_template(
        "index.html",
        role=session.get("role")
    )

@app.route("/inventory")
@login_required
def inventory_page():
    return render_template("inventory.html",
      role=session.get("role")
    )

@app.route("/assets")
@login_required
def assets_page():
    return render_template("assets.html",
      role=session.get("role")
    )


# ================= USERS PAGE =================
@app.route("/users")
@login_required
def users_page():
    return render_template("users.html",
      role=session.get("role")
    )


@app.route("/users/data")
@login_required
def users_data():
    con=db()
    rows=con.cursor().execute(
        "SELECT host_name,data FROM live_inventory"
    ).fetchall()
    con.close()

    result=[]
    for h,d in rows:
        payload=json.loads(d)
        payload["host_name"]=h
        result.append(payload)
    return jsonify(result)

@app.route("/users/ext", methods=["POST"])
@login_required
def save_ext():
    payload=request.json
    host=payload.get("host_name")
    ext=payload.get("ext_no","")

    con=db()
    cur=con.cursor()
    row=cur.execute(
        "SELECT data FROM live_inventory WHERE host_name=?",(host,)
    ).fetchone()

    if row:
        data=json.loads(row[0])
        data["ext_no"]=ext
        cur.execute(
            "UPDATE live_inventory SET data=? WHERE host_name=?",
            (json.dumps(data), host)
        )
        con.commit()

    con.close()
    return jsonify({"status":"saved"})

@app.route("/users/hedge", methods=["POST"])
@login_required
def save_hedge():
    data = request.json or {}
    host = data.get("host_name")
    hedge = data.get("hedge_expire","")

    con = db()
    cur = con.cursor()

    row = cur.execute(
        "SELECT data FROM live_inventory WHERE host_name=?",
        (host,)
    ).fetchone()

    if row:
        payload = json.loads(row[0])
        payload["hedge_expire"] = hedge

        cur.execute(
            "UPDATE live_inventory SET data=? WHERE host_name=?",
            (json.dumps(payload), host)
        )
        con.commit()

    con.close()
    return jsonify({"status":"ok"})

# ================= INVENTORY API =================

@app.route("/inventory/data")
@login_required
def inventory_data():
    con = db()
    rows = con.cursor().execute(
        "SELECT host_name,last_seen,data FROM live_inventory ORDER BY last_seen DESC"
    ).fetchall()
    con.close()

    result=[]
    for h,l,d in rows:
        payload=json.loads(d)
        payload["host_name"]=h
        payload["last_seen"]=l
        result.append(payload)

    return jsonify(result)


# ================= REPORT HELPERS =================
def load_inventory_data():
    con = db()
    rows = con.cursor().execute(
        "SELECT host_name, data FROM live_inventory"
    ).fetchall()
    con.close()

    result = []
    for h, d in rows:
        payload = json.loads(d)
        payload["host_name"] = h
        result.append(payload)
    return result


def generate_csv(rows):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

    return app.response_class(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=report.csv"}
    )


def generate_excel(rows):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

    return app.response_class(
        output.getvalue(),
        mimetype="application/vnd.ms-excel",
        headers={"Content-Disposition": "attachment;filename=report.xls"}
    )


def generate_pdf(rows):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 40
    for row in rows:
        line = " | ".join(str(v) for v in row.values())
        c.drawString(30, y, line)
        y -= 15
        if y < 40:
            c.showPage()
            y = height - 40

    c.save()
    buffer.seek(0)

    return app.response_class(
        buffer,
        mimetype="application/pdf",
        headers={"Content-Disposition": "attachment;filename=report.pdf"}
    )


@app.route("/reports")
@login_required
def reports():
    return render_template("reports.html",
      role=session.get("role")
    )



@app.route("/reports/data")
@login_required

def report_data():
    inventory = load_inventory_data()
    data = []

    for i in inventory:
        row = {
            "host_name": i.get("host_name"),
            "current_user": i.get("current_user"),
            "ip": i.get("network_adapters", [{}])[0].get("ip"),
            "os": i.get("os_name"),
            "asset_type": i.get("asset_type"),
            "ext_no": i.get("ext_no"),
            "hedge_expire": i.get("hedge_expire")
        }
        data.append(row)

    return jsonify(data)


@app.route("/reports/download", methods=["POST"])
@login_required
def download_report():
    payload = request.json
    fields = payload["fields"]
    fmt = payload["format"]

    rows = load_inventory_data()

    filtered = [
        {f: r.get(f, "") for f in fields}
        for r in rows
    ]

    if not filtered:
        return "No data", 400

    if fmt == "csv":
        return generate_csv(filtered)
    elif fmt == "excel":
        return generate_excel(filtered)
    else:
        return generate_pdf(filtered)


# ================= RESET (ADMIN ONLY) =================
@app.route("/settings")
@login_required
@role_required("admin")
def settings_page():
    return render_template("settings.html",
      role=session.get("role")
    )

@app.route("/settings/info")
@login_required
@role_required("admin")
def settings_info():
    con=db()
    live = con.cursor().execute(
        "SELECT COUNT(*) FROM live_inventory"
    ).fetchone()[0]
    users = len(USERS)
    con.close()
    return jsonify({"live":live,"users":users})

@app.route("/settings/users")
@login_required
@role_required("admin")
def settings_users():
    return jsonify([
      {"username":u,"role":USERS[u]["role"]}
      for u in USERS
    ])

@app.route("/settings/user/create", methods=["POST"])
@login_required
@role_required("admin")
def create_user():
    d=request.json
    USERS[d["user"]]={"password":d["pass"],"role":d["role"]}
    return jsonify({"ok":1})

@app.route("/settings/user/delete", methods=["POST"])
@login_required
@role_required("admin")
def delete_user():
    USERS.pop(request.json["user"],None)
    return jsonify({"ok":1})

@app.route("/settings/user/role", methods=["POST"])
@login_required
@role_required("admin")
def update_role():
    d=request.json
    USERS[d["user"]]["role"]=d["role"]
    return jsonify({"ok":1})


# ================= AGENT =================
@app.route("/agent/update", methods=["POST"])
def agent_update():
    payload=request.json or {}
    host=payload.get("host_name","UNKNOWN")

    con=db()
    cur=con.cursor()
    cur.execute("DELETE FROM live_inventory WHERE host_name=?", (host,))
    cur.execute("""
    INSERT INTO live_inventory(host_name,last_seen,data)
    VALUES (?,?,?)
    """,(host, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), json.dumps(payload)))
    con.commit()
    con.close()
    return jsonify({"status":"updated"})

# ================= RUN =================
if __name__=="__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
