type AuthState = {
   auth: User | null
}

type AuthActions = {
    setAuth: (auth: AuthState['auth']) => void
}