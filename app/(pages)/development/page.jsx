import React from "react";
import Link from "next/link";
import DeptHero from "@/components/DeptHero";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
    {
        name: "App Dev",
        description:
            "k*N$5c fu900Q 7k3 C20Z!g 1kL1d3er & nUKpZg %AU0₹g!ir3C.",
        href: "/7349e360-afdf-476d-9af8-20d680067f0b",
        cta: "Join Now",
    },
    {
        name: "Web Dev",
        description:
            "bp05Lb(bTI, CZWSr₹#^Z *7J ^T( f391xQ 1kp #q₹X 3z!Kux 6j(IkL.",
        href: "/2bd84c7a-ee2a-48b7-9568-6a4b094d3618",
        cta: "Join Now",
    },
];

const page = () => {
    return (
        <main>
            <DeptHero dept={{ name: "Development Departments" }} />

            <div className="development-content container">
                <ul className="development-list">
                    {features.map((feature) => (
                        <li key={feature.name}>
                            <Card className="development-card">
                                <CardHeader><CardTitle>{feature.name}</CardTitle></CardHeader>
                                <CardContent>
                                    <p>{feature.description}</p>
                                    <Button asChild><Link href={feature.href}>{feature.cta}</Link></Button>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
            <Footer />
        </main>
    );
};

export default page;
