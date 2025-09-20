import sqlite3

# Connect to database
conn = sqlite3.connect('hotel_management.db')
cursor = conn.cursor()

# Check demo users
cursor.execute("SELECT email, first_name, last_name, role FROM users WHERE email IN ('admin', 'client')")
demo_users = cursor.fetchall()

print("🔐 Demo Credentials en la Base de Datos:")
print("=" * 50)
for user in demo_users:
    print(f"Username: {user[0]}")
    print(f"Nombre: {user[1]} {user[2]}")
    print(f"Rol: {user[3]}")
    print("-" * 30)

# Also check all users
cursor.execute("SELECT email, first_name, last_name, role FROM users")
all_users = cursor.fetchall()

print("\n📊 Todos los usuarios en la BD:")
print("=" * 50)
for user in all_users:
    print(f"Email: {user[0]}, Nombre: {user[1]} {user[2]}, Rol: {user[3]}")

conn.close()
print("\n✅ Verificación completada!")