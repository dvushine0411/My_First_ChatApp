import bcrypt from 'bcrypt';
import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import Session from '../models/Session.js';
import crypto from 'node:crypto'; 

const ACCESS_TOKEN_TTL = '30s'; // 30 phút
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày 


export const signUp = async (req, res) => {
    try {
        const {username, password, email, firstname, lastname} = req.body;

        // Kiểm tra xem có trường nào còn thiếu hay không? //

        if(!username || !password || !email || !firstname || !lastname)
        {
            return res.status(400).json({
                message: "Không thể thiếu username, password, email, firstname, lastname"
            });

        }

        // Kiểm tra xem username có tồn tại hay chưa //
        const Duplicate = await User.findOne({username});

        if(Duplicate)
        {
            return res.status(400).json({
                message: "Username đã tồn tại"
            });
        }

        // Mã hoá password //

        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới //
        await User.create({
            username,
            hashedPassword, 
            email,
            displayName: `${firstname} ${lastname}`
        });
        
        
        // return //
        return res.status(200).json({message: "Đăng ký thành công hãy đăng nhập để bắt đầu"});


    } catch (error) {
        console.log("Lỗi khi gọi signup", error);
        return res.sendStatus(500).json({
            message: "Lỗi hệ thống"
        })  
    };
}
export const signIn = async (req, res) => {
    try {
        // Lấy inputs //
        const {username, password} = req.body;

        if(!username || !password)
        {
            return res.status(400).json({
                message: "Thiếu username hoặc password"
            })
        }

        // Lấy hashedPassword trong database để so với password ở phần input //
        const user = await User.findOne({username});

        if(!user)
        {
            return res.status(401).json({
                message: "Lỗi username hoặc password không chính xác"
            })
        }

        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if(!passwordCorrect)
        {
            return res.status(401).json({
                message: "Lỗi sai username hoặc password"
            })
        }

        // Nếu khớp, tạo accesstoken với JWT //

        const accessToken = jwt.sign(
            {userID: user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: ACCESS_TOKEN_TTL}
        );

        // Tạo refresh token //

        const refreshToken = crypto.randomBytes(64).toString("hex");


        // Tạo session mới để lưu refresh token //
        await Session.create({
            userID: user._id,   
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        });

        // Trả refresh token về cho cookie //
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL
        });

        // Trả access token về cho res //
        return res.status(200).json({
            message: `User ${user.displayName} đã logged in thành công!`, accessToken
        });
        
    } catch (error) {
        console.log("Lỗi khi gọi signup", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}

export const signOut = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if(token)
        {
            await Session.deleteOne({refreshToken: token});
        }

        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "Logout thành công!"
        });

        
    } catch (error) {
        console.log("Lỗi khi gọi signout", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}

// Tạo accessToken mới từ RefreshToken //

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if(!token)
        {
            return res.status(401).json({
                message: "Token không tồn tại"
            })
        }

        const session = await Session.findOne({refreshToken: token});

        if(!session)
        {
            return res.status(403).json({
                message: "Token không hợp lệ hoặc đã hết hạn!"
            })
        }

        if(session.expiresAt < new Date())
        {
            return res.status(403).json({
                message: "Token đã hết hạn!"
            })
        }

        const accessToken = jwt.sign(
            {
                userID: session.userID
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: ACCESS_TOKEN_TTL
            }
        )

        return res.status(200).json({accessToken});


    } catch (error) {
        console.log("Lỗi khi gọi signup", error);
        return res.sendStatus(500).json({
            message: "Lỗi hệ thống"
        });
    }

}



