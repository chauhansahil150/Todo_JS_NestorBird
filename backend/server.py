#pip install flask-cors
#pip install flask-autoreload
#pip install flask-jwt-extended


from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS,cross_origin
from datetime import datetime, timedelta

# from flask_jwt_extended import JWTManager, jwt_required create_access_token, get_jwt_identity

app = Flask(__name__)
# app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'
# jwt = JWTManager(app)


#CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, supports_credentials=True)


DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''
DB_NAME = 'todo_nestorbird'

db = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)
cursor = db.cursor()

class CRMDatabase:
    def __init__(self, cursor):
        self.cursor = cursor

    def insert_data(self, table_name, column_names, data):
        print(data)
        columns = ', '.join(column_names)
        values_template = ', '.join(['%s'] * len(column_names))
        insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({values_template})"
        
        for row in data:
            values = [row[column] for column in column_names]  # Extract values from the dictionary
            self.cursor.execute(insert_query, tuple(values))
        
        db.commit()

        
    def fetch_data(self,table_name,condition):
        select_query=f"SELECT * FROM {table_name} WHERE {condition}"
        self.cursor.execute(select_query)
        return self.cursor.fetchall()

    def fetch_all_data(self, table_name):
         select_query = f"SELECT * FROM {table_name}"
         self.cursor.execute(select_query)
         return self.cursor.fetchall()
    

    def update_data(self, table_name, update_data, condition):
        update_query = f"UPDATE {table_name} SET {', '.join([f'{key} = %s' for key in update_data.keys()])} WHERE {condition}"
        self.cursor.execute(update_query, tuple(update_data.values()))
        db.commit()

    def delete_data(self, table_name, condition):
        delete_query = f"DELETE FROM {table_name} WHERE {condition}"
        self.cursor.execute(delete_query)
        db.commit()
        
    def create_todo_table(self):
        create_table_query = """
        CREATE TABLE IF NOT EXISTS todos (
            id  VARCHAR(255) NOT NULL,
            title VARCHAR(255),
            description VARCHAR(255),
            status VARCHAR(255),
            start_date DATETIME,
            start_time VARCHAR(255),
            end_time VARCHAR(255),
            end_date DATETIME
        )
        """
        self.cursor.execute(create_table_query)
        db.commit()
        
# Initialize CRMDatabase
crm_db = CRMDatabase(cursor)
crm_db.create_todo_table()


@app.route('/fetch',methods=['GET'])
@cross_origin(origins=[u"*"])
def fetch_data():
    try:
        data=crm_db.fetch_all_data("todos")
        print(data)
        cols=[x for x in ['id','title', 'description', 'status','start_date','start_time','end_time','end_date']]
        res=[dict(zip(cols,row)) for row in data]
        if data:
            return jsonify({'data':res}),200
        else:
            return jsonify({"error":"error"}),201
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500


@app.route('/insert', methods=['POST'])
@cross_origin(origins=[u"*"])
def insert_data():
    try:
        data = request.json
        # user_id=get_jwt_identity()
        # data['posted_by'] = user_id  
        # print(data)# Corrected line
        if data:
            crm_db.insert_data("todos", ['id','title', 'description', 'status','start_date','start_time','end_time','end_date'], [data])
            return jsonify({'message': 'Data inserted successfully'}),200
        else:
            return jsonify({'error': 'No data provided'})
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"An error occurred: {e}")
        # Return an error response
        return jsonify({'error': 'An internal server error occurred'}), 500


# @app.route('/fetch')
# @cross_origin(origins=[u"*"])
# def fetch_data():
#     user_id=get_jwt_identity()
#     role=crm_db.get_user_role(user_id)
#     data = crm_db.fetch_all_data("customers",{'role':role[0], 'user_id':user_id})
#     print(data)
#     cols=[x for x in ['id','Customer_Name', 'Company', 'Email','Phone_Number','Interaction_History','Lead_Status','posted_by']]
#     res=[dict(zip(cols,row)) for row in data]
#     if data:
#         return jsonify({'data':res}),200
#     else:
#         return jsonify({'message':'error'}),201

@app.route('/update/<int:id>', methods=['PUT'])
@cross_origin(origins=[u"*"])
def update_data(id):
    data = request.json
    if data:
        crm_db.update_data("todos", data, f"id = {id}")
        return jsonify({'message': f'Data with ID {id} updated successfully'})
    else:
        return jsonify({'error': 'No data provided'})
    

@app.route('/delete/<int:id>', methods=['DELETE'])
@cross_origin(origins=[u"*"])
def delete_data(id):
    crm_db.delete_data("todos", f"id = {id}")
    return jsonify({'message': f'Data with ID {id} deleted successfully'})


if __name__ == '__main__':
    app.run(port=8000)