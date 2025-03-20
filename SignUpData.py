from flask import Flask, request, jsonify
import psycopg2
import bcrypt

app = Flask(__name__)

# PostgreSQL connection setup
def get_db_connection():
    conn = psycopg2.connect(dbname="your_dbname", user="your_username", password="your_password", host="localhost")
    return conn

@app.route('/signup', methods=['POST'])
def signup():
    # Get data from the request
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    title = data.get('title', None)
    age = data.get('age')  # Add the age parameter here
    gender = data.get('gender')  # Add the gender parameter here
    
    # Hash the password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert user into the 'users' table with age and gender
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, title, age, gender)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
        """, (name, email, password_hash, title, age, gender))

        # Get the user ID
        user_id = cursor.fetchone()[0]

        # Insert additional data into 'patient_data' if available
        phone_number = data.get('phone_number')
        height = data.get('height')
        weight = data.get('weight')
        diet = data.get('diet')
        allergies = data.get('allergies')
        last_visit = data.get('last_visit')
        visit_reason = data.get('visit_reason')

        if phone_number:
            cursor.execute("""
                INSERT INTO patient_data (user_id, phone_number, height, weight, diet, allergies, last_visit, visit_reason)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (user_id, phone_number, height, weight, diet, allergies, last_visit, visit_reason))

        # Commit the transaction
        conn.commit()

        return jsonify({"message": "User signed up successfully!"}), 200

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        return jsonify({"error": "An error occurred while signing up."}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
