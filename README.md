# SignUp

**localhost:3007/user/signup**

{
    "email":"persona@mail.com",
    "username":"persona",
    "password":"contrasena",
    "confirmPassword":"contrasena"
}

# SignIn

**localhost:3007/user/signin**

{
    "email":"persona@mail.com",
    "password":"contrasena"
}

# FetchRestaurant (Sólo funciona con lat, lon en EEUU)

**localhost:3007/user/fetchRestaurant**

Authorization : Bearer Token

{
"lat": "40.68919",
"lan": "-73.992378",
"distance": "1000",
"size": "30",
"page": "2",
"cuisine": "Italian",
"top_cuisines": "true"
}

# History

**localhost:3007/user/historyList**

Authorization : Bearer Token
