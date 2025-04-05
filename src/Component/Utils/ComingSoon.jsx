import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Smile } from "lucide-react"; // Using Lucide Icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent px-4">
            {/* Animated Container */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <Card className="text-center bg-white shadow-xl rounded-lg p-4 border border-gray-300">
                    <CardHeader>
                        {/* Coming Soon Title with Clock Icon */}
                        <CardTitle className="text-5xl font-extrabold text-gray-900 flex justify-center items-center gap-2">
                            Coming Soon <Clock className="text-green-500" size={42} />
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {/* Surprise Icon using Lucide's Smile icon with a scaling animation */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1.1 }}
                            transition={{ repeat: Infinity, duration: 1, repeatType: "mirror" }}
                            className="flex justify-center mb-6"
                        >
                            <Smile className="text-gray-700" size={64} />
                        </motion.div>

                        <p className="text-lg text-gray-700 font-medium">
                            Our exciting new feature is under construction. Please check back soon for updates!
                        </p>

                        {/* Button to go back to Menu */}
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
                            className="mt-6"
                        >
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-lg font-semibold shadow-md transition"
                                onClick={() => navigate("/menu")}
                            >
                                Back to Menu
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ComingSoon;
