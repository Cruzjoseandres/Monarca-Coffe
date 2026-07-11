const saveAccessToken = (token) => {
    localStorage.setItem("tokenCafeteria", token);
}

const getAccessToken = () => {
    const token = localStorage.getItem("tokenCafeteria");
    return token;
}

const removeAccessToken = () => {
    localStorage.removeItem("tokenCafeteria");
    localStorage.removeItem("userInfo");
}

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

const getUserFromToken = () => {
    const token = getAccessToken();
    if (!token) return null;
    return decodeToken(token);
}

const saveUserInfo = (userInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

const getUserInfo = () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
}

export { saveAccessToken, getAccessToken, removeAccessToken, decodeToken, getUserFromToken, saveUserInfo, getUserInfo };
