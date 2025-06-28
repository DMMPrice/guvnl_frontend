import React, {useState} from 'react';
import InputField from "@/Component/Utils/InputField.jsx";
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';
import {toast} from 'react-toastify';
import {Button} from "@/components/ui/button";
import axios from 'axios';

const defaultForm = {
    ConsumerID: '',
    Name: '',
    Consumer_type: '',
    Address: '',
    District: '',
    PinCode: '',
    DTR_id: ''
};

export default function AddUserModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);

    const consumerTypes = ["LT", "HT", "Industrial", "Residential"];

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Make API call to backend
            const response = await axios.post('/api/consumers', form);
            if (response.status === 200) {
                toast.success("Consumer added successfully");
                setForm(defaultForm);
                setIsOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add consumer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full bg-transparent px-4">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between py-3">
                    <h1 className="text-2xl font-bold">Add Consumer</h1>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button className="bg-green-700 w-full md:w-auto hover:bg-green-800"
                                onClick={() => setIsOpen(true)}>
                            Add Consumer
                        </Button>
                        <Button className="bg-green-700 w-full md:w-auto hover:bg-green-800"
                                onClick={() => setIsOpen(true)}>
                            Edit Consumer
                        </Button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded shadow-lg w-full max-w-md"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <h2 className="text-xl font-bold">Add New Consumer</h2>
                            <InputField label="Consumer ID" name="ConsumerID" value={form.ConsumerID}
                                        onChange={handleChange}/>
                            <InputField label="Name" name="Name" value={form.Name} onChange={handleChange}/>
                            <CustomSelect label="Consumer Type" name="Consumer_type" value={form.Consumer_type}
                                          options={consumerTypes} onChange={handleChange}/>
                            <InputField label="Address" name="Address" value={form.Address} onChange={handleChange}/>
                            <InputField label="District" name="District" value={form.District} onChange={handleChange}/>
                            <InputField label="Pin Code" name="PinCode" value={form.PinCode} onChange={handleChange}/>
                            <InputField label="DTR ID" name="DTR_id" value={form.DTR_id} onChange={handleChange}/>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                            <Button type="button" variant="secondary" className="w-full sm:w-auto"
                                    onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
