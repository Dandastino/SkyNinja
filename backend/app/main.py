from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db_connection import test_connection
from sqlalchemy import engine, text
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash

import logging
import os 

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://travelease:password@localhost:5434/travelease")

class User(BaseModel):
    first_name: str
    last_name: str
    username: str
    prefix: str
    phone_number: int
    email: str
    password: str

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