
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LockIcon, AtSignIcon } from "@/components/icons/Icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check the hardcoded credentials
    setTimeout(() => {
      if (email === "admin@gmail.com" && password === "admin123") {
        // Successful login
        toast({
          title: "Login successful",
          description: "Welcome to the Soil Classification System",
          variant: "default",
        });
        navigate("/dashboard");
      } else {
        // Failed login
        toast({
          title: "Login failed",
          description: "Invalid credentials. Use admin@gmail.com / admin123",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-earth-light to-soil-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-soil-dark mb-2">Soil Snapshot AI</h1>
          <p className="text-muted-foreground text-lg">Advanced soil classification for biologists</p>
        </div>
        
        <Card className="border-soil-light shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the soil analysis tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <AtSignIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Use: admin@gmail.com / admin123
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-soil-dark hover:bg-earth-dark h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              A professional tool for soil scientists and biologists
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
