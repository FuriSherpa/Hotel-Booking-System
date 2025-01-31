import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";

const app = express(); // creating express app
app.use(express.json()) // converts the body of api into json automatically
app.use(express.urlencoded({extended: true})) // parse the url to get parameters
app.use(cors()) // for security


app.get("/api/test", async (req: Request, res: Response)=> {
    res.json({message: "hello from express endpoint!"});
});

app.listen(7000, ()=> {
    console.log("Server running on localhost 7000");
});