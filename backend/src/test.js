import dotenv from 'dotenv'
import { gerarId } from './src/models/usuarioModels.js'

dotenv.config()

console.log(process.env.DATABASE_URL)

console.log(gerarId())