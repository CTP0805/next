import Image from "next/image";
import Header from "@/components/Header";
import Content from "./content";

export default function Member() {
    return (
        <>
            <Header />
            <div className="container">
                <section className="content">
                    <Content />
                </section>
            </div>
        </>
    );
}

