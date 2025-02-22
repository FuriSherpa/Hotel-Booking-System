import express, { Request, Response } from "express";
import multer from 'multer';
import cloudinary from "cloudinary";
import Hotel, { HotelType } from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

router.post(
    "/",
    verifyToken, [
    body("name").notEmpty().withMessage('Name is required.'),
    body("city").notEmpty().withMessage('City is required.'),
    body("address").notEmpty().withMessage('Address is required.'),
    body("description").notEmpty().withMessage('Description is required.'),
    body("pricePerNight").notEmpty().isNumeric().withMessage('Price Per Night is required and must be a number.'),
    body("facilities").notEmpty().isArray().withMessage('Facitlies is required.'),
],
    upload.array("imageFiles", 6),
    async (req: Request, res: Response) => {
        try {
            const imageFiles = req.files as Express.Multer.File[];
            const newHotel: HotelType = req.body;

            const imageUrls = await uploadImages(imageFiles);

            // add urls to the new hotel
            newHotel.imageUrls = imageUrls;
            newHotel.lastUpdated = new Date();
            newHotel.userId = req.userId;

            // save new hotel in the database
            const hotel = new Hotel(newHotel);
            await hotel.save();

            res.status(201).send(hotel);

        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Error creating hotel" });
        }
    });

router.get("/", verifyToken, async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find({ userId: req.userId });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: "Error fetching hotels" })
    }
});

async function uploadImages(imageFiles:Express.Multer.File[]) {
    // upload image to cloudinary
    const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");
        let dataURI = "data:" + image.mimetype + ";base64," + b64;
        const res = await cloudinary.v2.uploader.upload(dataURI);
        return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}

export default router;