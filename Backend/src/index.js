import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

import connection_db from "./db/index.js";
import {app} from "./app.js"


connection_db()

.then(() => {
    app.listen(process.env.PORT || 8000,  ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    });
})
.catch((err) =>{
    console.log("You have recieved an error !!!" , err);
})





// app = express()

// (async () =>
// {
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI} / ${DB_Name}`)
//         app.on("error", (error) => {
//             console.log("error", error);
//             throw error;
//         }
//     )
//     app.listen(process.env.PORT, ()=>{
//         console.log(`App is listening on port ${process.env.PORT}`)
//     })

//     } catch (error) {
//         console.log(error);
//     }

// })()