import "./member.css";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

export default function Member() {
    return (
        <>
            {/* Header */}
            <Header />
            <div className="container">
                <Sidebar />
            </div>
        </>
    );
}