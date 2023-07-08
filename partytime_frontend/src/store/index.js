import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

export default createStore({
  state() {
    return { // Estados
      authenticated: false,
      token: null,
      userId: null
    }
  },
  mutations: {
    authenticate(state, data) { // Mutation para setar os estados
      state.authenticated = true
      state.token = data.token
      state.userId = data.userId
    },
    logout(state) { // Método para deslogar o usuário
      state.authenticated = false
      state.token = null
      state.userId = null
    },
  },
  getters: {
    authenticated: state => state.authenticated, // Pegar o estado que define se o usuário está autenticado ou não
    token: state => state.token, // Pegar o Token
    userId: state => state.userId // Pegar o id do usuário
  },
  plugins: [vuexLocal.plugin]
})
