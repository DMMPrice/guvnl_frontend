import React, { useState, useEffect } from "react";

const Settings = () => {
    const [selectedBg, setSelectedBg] = useState(localStorage.getItem("userBg") || "url('/background.jpeg')");
    const [textColor, setTextColor] = useState(localStorage.getItem("userTextColor") || "text-gray-900");
    const [bgOpacity, setBgOpacity] = useState(localStorage.getItem("userBgOpacity") || "100"); // Default: Fully visible

    useEffect(() => {
        document.documentElement.style.setProperty("--user-bg", selectedBg);
        document.documentElement.style.setProperty("--user-text", textColor);
        document.documentElement.style.setProperty("--user-bg-opacity", bgOpacity + "%");
    }, [selectedBg, textColor, bgOpacity]);

    const handleBgChange = (e) => {
        const newBg = e.target.value;
        const formattedBg = newBg.startsWith("#") ? newBg : `url(${newBg})`;
        setSelectedBg(formattedBg);
        localStorage.setItem("userBg", formattedBg);
        document.documentElement.style.setProperty("--user-bg", formattedBg);
    };

    const handleTextColorChange = (e) => {
        const newColor = e.target.value;
        setTextColor(newColor);
        localStorage.setItem("userTextColor", newColor);
        document.documentElement.style.setProperty("--user-text", newColor);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imgUrl = URL.createObjectURL(file);
            setSelectedBg(`url(${imgUrl})`);
            localStorage.setItem("userBg", `url(${imgUrl})`);
            document.documentElement.style.setProperty("--user-bg", `url(${imgUrl})`);
        }
    };

    const handleOpacityChange = (e) => {
        const opacityValue = e.target.value;
        setBgOpacity(opacityValue);
        localStorage.setItem("userBgOpacity", opacityValue);
        document.documentElement.style.setProperty("--user-bg-opacity", opacityValue + "%");
    };

    const resetToDefault = () => {
        setSelectedBg("url('/background.jpeg')");
        localStorage.setItem("userBg", "url('/background.jpeg')");
        document.documentElement.style.setProperty("--user-bg", "url('/background.jpeg')");

        setTextColor("text-gray-900");
        localStorage.setItem("userTextColor", "text-gray-900");
        document.documentElement.style.setProperty("--user-text", "text-gray-900");

        setBgOpacity("100");
        localStorage.setItem("userBgOpacity", "100");
        document.documentElement.style.setProperty("--user-bg-opacity", "100%");
    };

    return (
        <div className={`max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg ${textColor}`}>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            {/* Background Color Picker */}
            <div className="mb-4">
                <label className="text-lg font-semibold">Select Background Color:</label>
                <input
                    type="color"
                    onChange={handleBgChange}
                    className="block mt-2 w-20 h-10 cursor-pointer border rounded-md"
                />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
                <label className="text-lg font-semibold">Upload Background Image:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block mt-2"
                />
            </div>

            {/* Text Color Selector */}
            <div className="mb-4">
                <label className="text-lg font-semibold">Select Text Color:</label>
                <select
                    onChange={handleTextColorChange}
                    value={textColor}
                    className="mt-2 block p-2 border rounded-md w-full"
                >
                    <option value="text-gray-900">Black</option>
                    <option value="text-red-600">Red</option>
                    <option value="text-blue-600">Blue</option>
                    <option value="text-green-600">Green</option>
                    <option value="text-yellow-600">Yellow</option>
                    <option value="text-purple-600">Purple</option>
                    <option value="text-pink-600">Pink</option>
                    <option value="text-gray-600">Gray</option>
                </select>
            </div>

            {/* Background Opacity Slider */}
            <div className="mb-4">
                <label className="text-lg font-semibold">Background Opacity: {bgOpacity}%</label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={bgOpacity}
                    onChange={handleOpacityChange}
                    className="w-full mt-2"
                />
            </div>

            {/* Reset Button */}
            <button
                onClick={resetToDefault}
                className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            >
                Reset to Default
            </button>
        </div>
    );
};

export default Settings;
