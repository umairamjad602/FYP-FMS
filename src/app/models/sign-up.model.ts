export interface signUp {
    id?: number
    name: string
    surName: string
    userName: string
    email: string
    preferredLanguage: string 
    password: string
}

export interface signIn {
    email: string
    password: string
}