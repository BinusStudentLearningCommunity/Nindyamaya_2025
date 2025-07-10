import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './HomePage.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const HomePage: React.FC = () => {
    const { userRole } = useOutletContext<{ userRole: 'mentor' | 'mentee' }>();

    const settings: import("react-slick").Settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };


    return (
        <div className="home-page">
            <h1 className="page-title">Home</h1>

            {/* Mentee Page */}
            {userRole === 'mentee' && (
                <div className="content">
                    <p className="first-section">Mentoring Session</p>
                    <div className="second-section">
                        <div className="table-section">
                            <table>
                                <tr>
                                    <th>#</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Jam Mulai</th>
                                    <th>Jam Selesai</th>
                                    <th>Status</th>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>2</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>3</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>4</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>
                            </table>
                        </div>
                        <div className="button-section">
                            
                            <div className="first-button">
                                <p className="button-description">Learn and grow by joining your <span className="span-first-mentee">mentoring sessions</span></p>
                                {/* Navigation to Mentoring Session */}
                                <div className="button-container">
                                    <button className="button-first-mentee">Mentoring Session</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mentor Page */}
            {userRole === 'mentor' && (
                <div className="content">
                    <p className="first-section">Mentoring Session</p>
        
                    <div className="second-section">
                        <div className="table-section">
                            <table>
                                <tr>
                                    <th>#</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Jam Mulai</th>
                                    <th>Jam Selesai</th>
                                    <th>Status</th>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>2</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>3</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>

                                <tr>
                                    <td>4</td>
                                    <td>Course Session "Name"</td>
                                    <td>Course "Date"</td>
                                    <td>"Jam Mulai"</td>
                                    <td>"Jam Selesai"</td>
                                    <td>Course "Status"</td>
                                </tr>
                            </table>
                        </div>
                        <div className="button-section">
                            
                            <div className="first-button">
                                <p className="button-description">Manage your <span className="span-first">mentoring sessions</span> and support your Mentees.</p>
                                {/* Navigation to Mentoring Session */}
                                <div className="button-container">
                                    <button className="button-first">Mentoring Session</button>
                                </div>
                            </div>

                            <div className="second-button">
                                <p className="button-description">Start a <span className="span-second">new mentoring session</span> and guide your mentees to success.</p>
                                {/* Navigation to Create Session */}
                                <div className="button-container">
                                    <button className="button-second">Create Mentoring Session</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="third-section">
                        {/* Image Carousel */}
                        <div className="carousel">
                             <Slider {...settings}>
                                <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                                <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                                <div><img src="../../../../assets/bslc.png" alt="" className="carousel-image" /></div>
                            </Slider>
                        </div>

                        {/* My Mentee */}
                        <div className="list-mentee">
                            <p className="mentee-title">My Mentee</p>

                            {/* List Mentee */}
                            <div className="table-section">
                                <table>
                                    <tr>
                                        <th>#</th>
                                        <th>Photo Profile</th>
                                        <th>Mentee</th>
                                        <th>Jurusan</th>
                                        <th>Action</th>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>
                                            <div className="mentee-photo">
                                                <img src="../../../../assets/03. BSLC-Logo-Navbar.svg" alt="Mentee Photo" />
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="mentee-name">User "Name"</p>
                                                <p className="mentee-nim">User "NIM"</p>
                                            </div>
                                        </td>
                                        <td>Jurusan Mentee</td>
                                        <td>
                                            <button>View details</button>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>2</td>
                                        <td>
                                            <div className="mentee-photo">
                                                <img src="../../../../assets/03. BSLC-Logo-Navbar.svg" alt="Mentee Photo" />
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="mentee-name">User "Name"</p>
                                                <p className="mentee-nim">User "NIM"</p>
                                            </div>
                                        </td>
                                        <td>Jurusan Mentee</td>
                                        <td>
                                            <button>View details</button>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    )
};

export default HomePage;