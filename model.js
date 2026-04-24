module.exports ={ 
    getAccessToken: async (token) =>{ 
    return { 
        accessToken: token, 
        client: { id: 'abc' }, // Debe ser un objeto
        user: { id: 'usuario1'},
        accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000) } 
    },

    getClient: async (clientId, clientSecret) => { 
        return { 
            id: clientId, 
            grants: ['password'] 
        }; 
    },

    saveToken: async (token, client, user) => {
        return Object.assign({}, token, { client, user }); }, 

    getUser: async (username, password) => { 
        if(username === 'admin' && password === '1234') 
            return { id: 'usuario1' };
        return null; 
    },
     verifyScope: async (token, scope) => { return true; } 
}
