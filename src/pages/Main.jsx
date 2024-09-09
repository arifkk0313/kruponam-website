import { useState } from "react";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from 'html2canvas';

import qrImage from '../assets/qr-image.jpeg'; // Adjust the path based on where you place the image
import kruponam from '../assets/kr.png'; // Adjust the path based on where you place the image

// Ensure the root element for the modal is defined
Modal.setAppElement('#root');

const Main = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false); // State for terms and conditions
    const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
    const [department, setDepartment] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password
    const [year, setYear] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [error, setError] = useState('');
    const [showTicket, setShowTicket] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [passwordforModal, setPasswordForModal] = useState('');
    const [ticketData, setTicketData] = useState(null);
    const [showMobileInput, setShowMobileInput] = useState(false); // New state to handle mobile input
    const [showBankDetails, setShowBankDetails] = useState(false); // New state for bank details modal
    const [showTermsModal, setShowTermsModal] = useState(false); // State for showing Terms and Conditions modal

    const FIXED_QUANTITY = 1;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation checks
        if (!name.trim()) {
            setError('Name is required.');
            return;
        }
        if (!phone.trim() || !/^\d{10}$/.test(phone)) {
            setError('A valid 10-digit phone number is required.');
            return;
        }
        if (!transactionId.trim()) {
            setError('Transaction ID is required.');
            return;
        }
        if (!department.trim()) {
            setError('Department is required.');
            return;
        }
        if (!year.trim()) {
            setError('A valid year is required.');
            return;
        }
        if (!password) {
            setError('Password is required.');
            return;
        }
        if (!proofImage) {
            setError('proof is required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!termsAccepted) {
            setError('You must agree to the terms and conditions.');
            return;
        }
        // Prepare the form data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('transactionId', transactionId);
        formData.append('department', department);
        formData.append('password', password);
        formData.append('year', year);
        formData.append('quantity', FIXED_QUANTITY);
        if (proofImage) {
            formData.append('image', proofImage);
        }

        try {
            const response = await fetch('https://arrif-api.moshimoshi.cloud/api/v2/kruponam/payment-request', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setName('');
                setPhone('');
                setDepartment('');
                setConfirmPassword('');
                setTransactionId('');
                setYear('');
                setPassword('');
                setTermsAccepted(false);
                setProofImage(null);
                // Display success toast message
                toast.success('Payment request submitted successfully!');
            } else if (response.status === 405) {
                // Display specific error message for status code 405
                toast.error('You have already requested. Please wait.');
            } else {
                setError('Payment request failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        }
    };


    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setProofImage(e.target.files[0]);
        }
    };

    const handleMobileNumberSubmit = async () => {
        // setShowMobileInput(false); // Uncomment to hide the mobile input modal
        try {
            const response = await fetch(`https://arrif-api.moshimoshi.cloud/api/v2/kruponam/ticket?mobile=${encodeURIComponent(mobileNumber)}&password=${encodeURIComponent(passwordforModal)}`);
            console.log(response.status);

            if (response.ok) {
                setShowMobileInput(false);
                const data = await response.json();
                setTicketData(data?.ticket);
                setShowTicket(true); // Show ticket modal with data
            } else if (response.status === 302) {
                setMobileNumber('');
                setPasswordForModal('');
                toast.error('Password is mismatch');
            } else {
                setMobileNumber('');
                setPasswordForModal('');
                toast.error('Ticket is not available.');
            }
        } catch (err) {
            setMobileNumber('');
            setPasswordForModal('');
            toast.error('An error occurred. Please try again later.');
        }
    };


    const handleDownload = async () => {
        // Ensure ticketData is available
        if (!ticketData) {
            toast.error('Ticket data is not available.');
            return;
        }

        try {
            // Create a container to capture
            const ticketContainer = document.createElement('div');
            ticketContainer.style.width = '300px';
            ticketContainer.style.padding = '10px';
            ticketContainer.style.backgroundColor = 'white';
            ticketContainer.style.color = 'black';
            ticketContainer.style.fontFamily = 'Arial, sans-serif';

            ticketContainer.innerHTML = `
        <div style="position: relative;">
          <img src="${kruponam}" alt="Event Image" style="width: 100%; height: 500px; object-fit: cover;" />
          <div style="position: absolute; bottom: 20px; right: 15px; display: flex; align-items: flex-end; background: white; padding: 5px; border-radius: 5px; ">
            <div style="margin-right: 60px; text-align: left;">
              <div style="font-size: 12px; font-weight: bold; margin-bottom: 3px;">BOOKING ID: ${ticketData.bookingId}</div>
              <div style="font-size: 12px;">Name: ${ticketData.name}</div>
              <div style="font-size: 12px;">Phone: ${ticketData.phone}</div>
            </div>
            <img src="${ticketData.qrImage}" alt="QR Code" style="width: 95px; height: 85px;" />
          </div>
        </div>
      `;



            // Append to body and capture
            document.body.appendChild(ticketContainer);
            const canvas = await html2canvas(ticketContainer);
            document.body.removeChild(ticketContainer);

            // Convert canvas to image and trigger download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'event-ticket.png';
            link.click();

        } catch (error) {
            toast.error('An error occurred while generating the ticket.');
        }
    };
    const containerStyle = {
        margin: '70px auto',
        padding: '20px',
        backgroundColor: '#121212',
        color: '#ffffff',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        animation: 'fadeIn 1s ease-in-out',
        position: 'relative', // Add this to position the button correctly
    };

    const headingStyle = {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#1DB954',
        fontSize: '24px',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        marginTop: '10px',
        backgroundColor: '#282828',
        color: '#ffffff',
        transition: 'transform 0.2s ease-in-out',
    };

    const inputStyle2 = {
        width: '90%',
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        marginTop: '10px',
        backgroundColor: '#282828',
        color: '#ffffff',
        transition: 'transform 0.2s ease-in-out',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        color: '#B3B3B3',
    };

    const buttonStyle = {
        padding: '12px',
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
    };

    const buttonStyle2 = {
        padding: '12px',
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        marginTop: '10px',
        marginRight: '10px',
        marginBottom: '10px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
    };

    const termsStyle = {
        marginTop: '20px',
        fontSize: '12px',
        color: '#B3B3B3',
    };

    const modalStyle = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#121212',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            width: '350px', // Adjust width as needed
        },
    };
    const modalStyle2 = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#121212',
            color: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            width: '300px', // Adjust width as needed
        },
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <>
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button
                    onClick={() => setShowMobileInput(true)} // Show mobile input modal
                    style={{ ...buttonStyle, marginBottom: '10px', marginRight: '10px' }}
                >
                    View Ticket
                </button>
                <button
                    onClick={() => setShowBankDetails(true)} // Show bank details modal
                    style={buttonStyle}
                >
                    View Bank Details
                </button>
            </div>

            <div style={containerStyle}>
                <h1 style={headingStyle}>Onam Event Ticket Booking</h1>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div>
                        <label htmlFor="name" style={labelStyle}>Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.transform = 'scale(1.05)'}
                            onBlur={(e) => e.target.style.transform = 'scale(1)'}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" style={labelStyle}>Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.transform = 'scale(1.05)'}
                            onBlur={(e) => e.target.style.transform = 'scale(1)'}
                        />
                    </div>
                    <div>
                        <label htmlFor="text" style={labelStyle}>Transaction ID</label>
                        <input
                            type="text"
                            id="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.transform = 'scale(1.05)'}
                            onBlur={(e) => e.target.style.transform = 'scale(1)'}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={togglePasswordVisibility}
                            style={{ marginRight: '5px' }}
                        />
                        <label>Show Password</label>
                    </div>
                    <div>
                        <label htmlFor="department" style={labelStyle}>Department</label>
                        <select
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                            style={inputStyle}
                        >
                            <option value="">Select Department</option>
                            <option value="Bba">Bba</option>
                            <option value="Bba Aviation">Bba Aviation</option>
                            <option value="Bca">Bca</option>
                            <option value="Bcom">Bcom</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year" style={labelStyle}>Year</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                            style={inputStyle}
                        >
                            <option value="">Select Year</option>
                            <option value="First Year">First Year</option>
                            <option value="Second Year">Second Year</option>
                            <option value="Third Year">Third Year</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="proof" style={labelStyle}>Proof Image</label>
                        <input
                            type="file"
                            id="proof"
                            onChange={handleImageChange}
                            style={inputStyle2}
                        />
                    </div>
                    <label style={{ color: '#ffffff' }}>
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                            style={{ marginRight: '10px' }}
                        />
                        I agree to the <a href="#terms" onClick={() => setShowTermsModal(true)} style={{ color: '#1DB954' }}>Terms and Conditions</a>
                    </label>
                    <button type="submit" style={buttonStyle}>Submit</button>
                </form>

                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </div>

            <ToastContainer />

            {/* Ticket Modal */}
            <Modal
                isOpen={showTicket}
                onRequestClose={() => setShowTicket(false)}
                style={modalStyle}
            >
                <h2>Your Ticket</h2>
                {ticketData && (
                    <>
                        <p>Booking ID: {ticketData.bookingId}</p>
                        <p>Name: {ticketData.name}</p>
                        <p>Phone: {ticketData.phone}</p>
                        <p>QR Code:</p>
                        <img src={ticketData.qrImage} alt="QR Code" style={{ width: '100%' }} />
                        <button onClick={handleDownload} style={buttonStyle2}>Download QR Code</button>
                    </>
                )}
                <button onClick={() => setShowTicket(false)} style={buttonStyle2}>Close</button>
            </Modal>

            {/* Mobile Input Modal */}
            <Modal
                isOpen={showMobileInput}
                onRequestClose={() => setShowMobileInput(false)}
                style={modalStyle2}
            >
                <h2>Enter Mobile Number</h2>
                <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    style={inputStyle2}
                />
                <h2>Enter Password</h2>
                <input
                    type="text"
                    value={passwordforModal}
                    onChange={(e) => setPasswordForModal(e.target.value)}
                    placeholder="Enter your password"
                    style={inputStyle2}
                />
                <button onClick={handleMobileNumberSubmit} style={buttonStyle}>Submit</button>
                <button
                    onClick={() => setShowMobileInput(false)}
                    style={{ ...buttonStyle2, marginLeft: '10px' }}
                >
                    Cancel
                </button>

            </Modal>

            {/* Bank Details Modal */}
            <Modal
                isOpen={showBankDetails}
                onRequestClose={() => setShowBankDetails(false)}
                style={modalStyle}
            >
                <img src={qrImage} alt="QR Code" style={{ width: '100%', height: '500px' }} />
                <p style={{textAlign:'center'}}>OR</p>
                <p style={{ textAlign: 'center',fontWeight:'bold' }}>Gpay : 8590951584</p>
                <button onClick={() => setShowBankDetails(false)} style={buttonStyle2}>Close</button>
            </Modal>
            <Modal
                isOpen={showTermsModal}
                onRequestClose={() => setShowTermsModal(false)}
                contentLabel="Terms and Conditions"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    content: {
                        backgroundColor: '#121212',
                        color: '#ffffff',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        margin: 'auto',
                    },
                }}
            >
                <h2>Terms and Conditions</h2>
                <ol style={{ lineHeight: '1.6' }}>
                    <li>College ID: Only students with a valid college ID will be permitted to enter the event. (First-year students can show their official group chat as proof of enrollment.)</li>
                    <li>Attendees must agree to follow the rules and regulations set by the coordinators for the Onam celebration.</li>
                    <li>No Refunds: Tickets are non-refundable and non-transferable.</li>
                    <li>The coordinators are not responsible for attendees' personal belongings.</li>
                    <li>Attendees found to be under the influence of alcohol or any other intoxicating substance will be restricted from entering the function.</li>
                    <li>No Re-entry: Once attendees exit the function, they will not be allowed to re-enter.</li>
                    <li>Eligibility: This program is exclusively for Krupanidhi Degree Students.</li>
                </ol>
                <button onClick={() => setShowTermsModal(false)} style={buttonStyle2}>Close</button>
            </Modal>
        </>
    );
};

export default Main;
