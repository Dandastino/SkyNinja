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
    user_role: str
    first_name: str
    last_name: str
    username: str
    prefix: str
    phone_number: int
    email: str
    password: str

class UserUpdate(BaseModel):
    userRole: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    Username: Optional[str] = None
    prefix: Optional[str] = None
    phone_number: Optional[int] = None
    email: Optional[str] = None
    password: Optional[str] = None

class Accomodation(BaseModel):
    trip_id: int
    company_name: str
    location: str
    check_in_date: str
    check_in_time: str
    check_out_date: str
    check_out_time: str
    price: float
    currency: str

class Preferences(BaseModel):
    user_id: int
    travel_style_id : int
    accomodation_type_id : int
    accompaniment_type_id : int
    budget_range_id : int
    favorite_destination_id: int

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
            if user.userRole is not None:
                update_fields.append("user_role = :user_role")
                params["user_role"] = user.userRole
            if user.Username is not None:
                update_fields.append("username = :username")
                params["username"] = user.Username
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

@app.post("/preferences/{username}")
def insert_preferences(username: str, preferences : Preferences):
    if test_connection():
        try:
            with engine.connect() as connection:
                insert_query = text("""
                    INSERT INTO preferences (username, travel_style_id, accomodation_type_id, accompaniment_type_id, budget_range_id, favorite_destination_id)
                    VALUES (:username, :travel_style_id, :accomodation_type_id, :accompaniment_type_id, :budget_range_id, :favorite_destination_id)
                    ON CONFLICT (username) DO UPDATE SET travel_style_id = EXCLUDED.travel_style_id,
                        accomodation_type_id = EXCLUDED.accomodation_type_id,
                        accompaniment_type_id = EXCLUDED.accompaniment_type_id,
                        budget_range_id = EXCLUDED.budget_range_id,
                        favorite_destination_id = EXCLUDED.favorite_destination_id
                """)
                connection.execute(insert_query, {"username": username, "preferences": preferences})
                connection.commit()
            return {"message": "Preferences updated successfully"}
        except Exception as e:
            logging.error(f"Error inserting preferences: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")


####################################################################################################################
#                       B  O   O   K   I   N   G       M   A   N   A   G   E   M   E   N   T                       # 
####################################################################################################################

@app.post("/accommodations")
def insert_accommodation(accommodation: Accomodation):
    if test_connection():
        try:
            with engine.connect() as connection:
                insert_query = text("""
                    INSERT INTO accommodations (trip_id, company_name, location, check_in_date, check_in_time, check_out_date, check_out_time, price, currency)
                    VALUES (:trip_id, :company_name, :location, :check_in_date, :check_in_time, :check_out_date, :check_out_time, :price, :currency)
                """)
                connection.execute(insert_query, accommodation())
                connection.commit()
            return {"message": "Accommodation inserted successfully"}
        except Exception as e:
            logging.error(f"Error inserting accommodation: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    else:
        raise HTTPException(status_code=500, detail="Database connection failed")

# insert a new transportation

# delete a accomodation

# delete a transportation

####################################################################################################################
#                               T   R   I   P       M   A   N   A   G   E   M   E   N   T                          #
####################################################################################################################

# create a new trip

# update a trip

# delete a trip