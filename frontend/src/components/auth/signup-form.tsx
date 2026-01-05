import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { PasswordInput } from "@/components/ui/PasswordInput";



// Dùng thư viện Zod để kiểm tra các dữ liệu nhập vào //
const SignUpSchema = z.object({
  firstname: z.string().min(1, 'Tên bắt buộc phải có'),
  lastname: z.string().min(1, 'Tên bắt buộc phải có'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')

});

type SignupFormValues = z.infer<typeof SignUpSchema>



export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {

  const {signUp} = useAuthStore();
  const navigate = useNavigate();

  // formState: Trạng thái của Form (Gồm lỗi hay đang gửi) //
  // register: điền dữ liệu //
  // errors: Dùng để kiểm tra lỗi của dữ liệu nhập vào (Nếu lỗi thì trả ra text-destructive (dòng chữ đỏ báo lỗi đó)) //

  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignupFormValues>({
    resolver: zodResolver(SignUpSchema)
  })

  const onSubmit = async (data: SignupFormValues) => {

    const {firstname, lastname, username, email, password} = data;

    // // Gọi backend để signup //

    await signUp(username, password, email, firstname, lastname);

    navigate("/signin");


  }
  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>      
            <div className="flex flex-col gap-6">
              {
                // Header và logo
                <div className="flex flex-col items-center text-center gap-2">
                  <a href="/"
                     className="mx-auto block w-fit text-center"
                  >
                    <img 
                      src="/vite.svg" 
                      alt="logo" 
                    
                    />
                  </a>

                  <h1 className="text-2xl font-bold">Tạo tài khoản VIT Chat</h1>
                  <p className="text-muted-foreground text-balance">
                    Chào mừng bạn! Hãy đăng ký để bắt đầu
                  </p>
                </div>
              }

              {
                // Họ và tên
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="lastname" className="block text-sm">
                      Họ
                    </label>

                    <Input
                      type="text"
                      id="lastname"
                      placeholder="VD: Nguyen"
                      {...register("lastname")}
                    />
                    {errors.lastname && (
                      <p className="text-destructive text-sm">
                        {errors.lastname.message}
                      </p>
                    )}

                  </div>

                  <div className="space-y-2">
                    <label htmlFor="firstname" className="block text-sm">
                      Tên
                    </label>

                    <Input
                      type="text"
                      id="firstname"
                      placeholder="VD: A"
                      {...register("firstname")}
                    />

                    {errors.firstname && (
                      <p className="text-destructive text-sm">
                        {errors.firstname.message}
                      </p>
                    )}
                  </div>
                </div>      
              }

              {
                // username //
                <div className="flex flex-col gap3">
                  <label
                    htmlFor="username"
                    className="block text-sm"
                  >
                    Tên đăng nhập
                  </label>

                  <Input
                    type="text"
                    id="username"
                    placeholder="VD: NguyenVanA"
                    {...register("username")}
                  />

                  {errors.username && (
                      <p className="text-destructive text-sm">
                        {errors.username.message}
                      </p>
                    )}
                </div>
              }

              {
                // email //
                <div className="flex flex-col gap3">
                  <label
                    htmlFor="email"
                    className="block text-sm"
                  >
                    Email
                  </label>

                  <Input
                    type="text"
                    id="email"
                    placeholder="VD: abc123@gmail.com"
                    {...register("email")}
                  />

                  {errors.email && (
                      <p className="text-destructive text-sm">
                        {errors.email.message}
                      </p>
                    )}
                </div>
              }

              {
                // Password //
                <div className="flex flex-col gap3">
                  <label
                    htmlFor="password"
                    className="block text-sm"
                  >
                    Mật khẩu
                  </label>

                  <PasswordInput
                    id="password"
                    {...register("password")}
                  />

                  {errors.password && (
                      <p className="text-destructive text-sm">
                        {errors.password.message}
                      </p>
                    )}
                </div>
              }

              {
                // Nút đăng ký //
                <Button
                  type="submit"
                  className="w-full"  
                  disabled={isSubmitting}   // Button sẽ bị vô hiệu hoá trong khi đang gửi đi (isSubmitting) để tránh spam gửi nhiều lần //
                >
                  Tạo tài khoản
                </Button>
              }
                <div className="text-center text-sm">
                  Đã có tài khoản? {" "}
                  <a
                    href="/signin"
                    className="underline underline-offset-4"
                  >
                    Đăng nhập
                  </a>             
                </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/VIT-Banner-1.png"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-sx text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offetset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  )
}
