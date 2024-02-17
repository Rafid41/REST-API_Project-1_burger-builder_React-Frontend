// src\redux\authActionCreators.js
import * as actionTypes from "./actionTypes";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

//  eta dispatch hbe jokhn kono response ashbe firebase theke, means login/signUp hole
//  nicher auth fn theke dis[atch hye kehane ashbe, erpor reducer.js e jabe]
export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        payload: {
            token: token,
            userId: userId,
        },
    };
};

export const authLoading = (isLoading) => {
    return {
        type: actionTypes.AUTH_LOADING,
        payload: isLoading,
    };
};

// Firbase authentication Failed
export const authFailed = (errMsg) => {
    return {
        type: actionTypes.AUTH_FAILED,
        payload: errMsg,
    };
};

const saveTokenDataAndGetUserID = (access) => {
    // decoding token
    const token = jwtDecode(access);
    localStorage.setItem("token", access);
    localStorage.setItem("userId", token.user_id);
    const expirationTime = new Date(token.exp * 1000);
    localStorage.setItem("expirationTime", expirationTime);

    return token.user_id;
};

export const auth = (email, password, mode) => (dispatch) => {
    dispatch(authLoading(true)); // true ta payLoad hisebe pass hbe

    const authData = {
        email: email,
        password: password,
    };

    // connecting with django backend
    let authUrl = null;
    if (mode === "Sign Up") {
        authUrl = "http://localhost:8000/api/users/";
    } else {
        authUrl = "http://localhost:8000/api/token/";
    }

    axios
        .post(authUrl, authData)
        .then((response) => {
            dispatch(authLoading(false));

            if (mode === "Login") {
                const access = response.data.access;
                const user_id = saveTokenDataAndGetUserID(access);
                dispatch(authSuccess(access, user_id));
            } else {
                // Sign up
                return axios
                    .post("http://localhost:8000/api/token/", authData)
                    .then((response) => {
                        const access = response.data.access;
                        const user_id = saveTokenDataAndGetUserID(access);
                        dispatch(authSuccess(access, user_id));
                    });
            }
        })
        .catch((err) => {
            dispatch(authLoading(false));
            // taking first key of error message
            const key = Object.keys(err.response.data)[0];
            const errorValue = err.response.data[key];
            dispatch(authFailed(errorValue));
        });
};

//auto logout actions for auth token
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("userId");

    return {
        type: actionTypes.AUTH_LOGOUT,
    };
};

// app load holei eta call korte hbe Main.js theke
export const authCheck = () => (dispatch) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // token na thakle logout
        dispatch(logout());
    } else {
        // string return kore, new Date() oitake dateTime e convert kore
        const expirationTime = new Date(localStorage.getItem("expirationTime"));

        // time expire kina chk
        if (expirationTime <= new Date()) {
            //logout
            dispatch(logout());
        } else {
            const userId = localStorage.getItem("userId");
            dispatch(authSuccess(token, userId));
        }
    }
};
