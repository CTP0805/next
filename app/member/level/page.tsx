import Image from "next/image";
import Header from "@/components/Header";
import Sidebar from "@/components/sidebar";
import Content from "./content";

export default function Member() {
    return (
        <>
            <Header />
            <div className="container">
                <Sidebar />
                <section className="content">
                    <Content />
                </section>
            </div>
        </>
    );
}

