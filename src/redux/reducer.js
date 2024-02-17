// src\redux\reducer.js
import * as actionTypes from "./actionTypes";
import { authLoading } from "./authActionCreators";

const INGREDIENT_PRICES = {
    salad: 20,
    cheese: 40,
    meat: 90,
};
const INITIAL_STATE = {
    ingredients: [
        // amount means ei type koyta count thakbe, amount joto thakbe, totobar call korte hbe
        //  soja kothay c++: map[type] = amount
        { type: "salad", amount: 0 },
        { type: "cheese", amount: 0 },
        { type: "meat", amount: 0 },
    ],
    orders: [],
    orderLoading: true,
    orderErr: false,
    totalPrice: 20,
    purchasable: false,
    // store firebase token and user id
    // authActionCreaters.js theke dispatch hye nicher switchcase giye hit korle ekhan theke update hbe
    token: null,
    userId: null, // null means user is not authenticated
    // for auth spinner
    authLoading: false,
    // for auth error
    authFailedMsg: null,
};

export const reducer = (state = INITIAL_STATE, action) => {
    // copy of state.ingredients
    const ingredients = [...state.ingredients];

    switch (action.type) {
        case actionTypes.ADD_INGREDIENT:
            // count of amount
            for (let item of ingredients) {
                // actionCreators.js theke payload hisebe ashse
                if (item.type === action.payload) item.amount++;
            }
            return {
                ...state,
                ingredients: ingredients,
                totalPrice:
                    state.totalPrice + INGREDIENT_PRICES[action.payload],
            };

        case actionTypes.REMOVE_INGREDIENT:
            // count of amount
            for (let item of ingredients) {
                // actionCreators.js theke payload hisebe ashse
                if (item.type === action.payload) {
                    if (item.amount <= 0) return state;
                    item.amount--;
                }
            }
            return {
                ...state,
                ingredients: ingredients,
                totalPrice:
                    state.totalPrice - INGREDIENT_PRICES[action.payload],
            };

        case actionTypes.UPDATE_PURCHASABLE:
            const sum = state.ingredients.reduce((sum, element) => {
                return sum + element.amount;
            }, 0); //sum er initial value 0

            return {
                ...state,
                purchasable: sum > 0,
            };

        case actionTypes.RESET_INGREDIENTS:
            return {
                ...state,
                ingredients: [
                    { type: "salad", amount: 0 },
                    { type: "cheese", amount: 0 },
                    { type: "meat", amount: 0 },
                ],
                totalPrice: 20,
                purchasable: false,
            };

        case actionTypes.LOAD_ORDERS:
            let orders = [...action.payload];

            return {
                ...state,
                orders: orders,
                orderLoading: false,
            };

        case actionTypes.ORDER_LOAD_FAILED:
            return {
                ...state,
                orderErr: true,
                orderLoading: false,
            };

        // AUTH cases:
        case actionTypes.AUTH_SUCCESS:
            return {
                ...state,
                token: action.payload.token,
                userId: action.payload.userId,
            };

        //logout
        case actionTypes.AUTH_LOGOUT:
            return {
                ...state,
                token: null,
                userId: null,
                authFailedMsg: null,
            };

        case actionTypes.AUTH_LOADING:
            return {
                ...state,
                authLoading: action.payload,
            };

        // authentication error
        case actionTypes.AUTH_FAILED:
            return {
                ...state,
                authFailedMsg: action.payload,
            };

        default:
            return state;
    }
};
