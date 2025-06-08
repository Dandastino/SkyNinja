from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db_connection import test_connection
from sqlalchemy import engine, text
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional

import logging
import os 

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://travelease:password@localhost:5434/travelease")

logging.basicConfig(
    filename='app.log',           
    level=logging.INFO,           
    format='%(asctime)s %(levelname)s %(message)s'
)

class User(BaseModel):
    first_name: str
    last_name: str
    username: str
    prefix: str
    phone_number: int
    email: str
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    prefix: Optional[str] = None
    phone_number: Optional[int] = None
    email: Optional[str] = None
    password: Optional[str] = None

####################################################################################################################
#                               U   S   E   R       M   A   N   A   G   E   M   E   N   T                          #
####################################################################################################################

@app.post("/singup")
def singup(user: User):
    hashedpassword = generate_password_hash(user.password)
    if test_connection():
        try:
            with engine.connect() as connection:
                insert = text("""
                    INSERT INTO users (first_name, last_name, username, prefix, phone_number, email, password)
                    VALUES (:first_name, :last_name, :username, :prefix, :phone_number, :email, :password)""")
                check_username = text("SELECT 1 FROM users WHERE username = :username")
                result = connection.execute(check_username, {"username": user.username}).fetchone()
                if result:
                    raise HTTPException(status_code=400, detail="Username already exists")

                connection.execute(insert,{"first_name": user.first_name,
                                            "last_name": user.last_name,
                                            "username": user.username,
                                            "prefix": user.prefix,
                                            "phone_number": user.phone_number,
                                            "email": user.email,
                                            "password": hashedpassword})
                connection.commit()
                return {"message": "User created successfully"}
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")
    

@app.post("/login")
def login(user: User):
    original_password = check_password_hash(user.password)
    if test_connection():
        try:
            with engine.connect() as connection:
                query = text("SELECT password FROM users  WHERE username = :username")
                result = connection.execute(query, {"username": user.username, "password": user.original_password})
                if result and check_password_hash(result[0], user.password):
                    return {"message": "Login successful"}
                else:
                    raise HTTPException(status_code=401, detail="Invalid credentials")
        except Exception as e:
            logging.error(f"Error during login: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")


@app.patch("/update_user/{username}")
def update_user(username: str, user: UserUpdate):
    if test_connection():
        try:
            update_fields = []
            params = {"username": username}
            if user.first_name is not None:
                update_fields.append("first_name = :first_name")
                params["first_name"] = user.first_name
            if user.last_name is not None:
                update_fields.append("last_name = :last_name")
                params["last_name"] = user.last_name
            if user.prefix is not None:
                update_fields.append("prefix = :prefix")
                params["prefix"] = user.prefix
            if user.phone_number is not None:
                update_fields.append("phone_number = :phone_number")
                params["phone_number"] = user.phone_number
            if user.email is not None:
                update_fields.append("email = :email")
                params["email"] = user.email
            if user.password is not None:
                update_fields.append("password = :password")
                params["password"] = generate_password_hash(user.password)
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE username = :username"
            with engine.connect() as connection:
                connection.execute(update_query, params)
                connection.commit()
            return {"message": "User updated successfully"}
        except Exception as e:
            logging.error(f"Error updating user: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")
    

@app.delete("/delete_user/{username}")
def delete_user(username: str):
    if test_connection():
        try:
            with engine.connect() as connection:
                delete_query = text("DELETE FROM users WHERE username = :username")
                connection.execute(delete_query, {"username": username})
                connection.commit()
            return {"message": "User deleted successfully"}
        except Exception as e:
            logging.error(f"Error deleting user: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")


####################################################################################################################
#                 P   R   E   F   E   R   E   N   C   E   S       M   A   N   A   G   E   M   E   N   T            #
####################################################################################################################

# insert user preferences

# update user preferences


####################################################################################################################
#                       B  O   O   K   I   N   G       M   A   N   A   G   E   M   E   N   T                       # 
####################################################################################################################

# insert a new accomodation

# insert a new transportation

# delete a accomodation

# delete a transportation

####################################################################################################################
#                               T   R   I   P       M   A   N   A   G   E   M   E   N   T                          #
####################################################################################################################

# create a new trip

# update a trip

# delete a trip