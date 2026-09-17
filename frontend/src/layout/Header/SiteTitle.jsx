import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import saka1 from "../../assets/saka1.png";
import saka2 from "../../assets/saka2.png";

export default function SiteTitle() {
    return (
        <Container fluid className="site-title h-100">
            <Row className="align-items-center justify-content-center g-3 h-100">
                <Col xs="auto" className="h-100">
                    <Image src={saka1} alt="Bukayo Saka" className="site-title__image" />
                </Col>
                <Col xs="auto">
                    <h1 className="mb-0">Starboys FPL</h1>
                </Col>
                <Col xs="auto" className="h-100">
                    <Image src={saka2} alt="Bukayo Saka" className="site-title__image" />
                </Col>
            </Row>
        </Container>
    );
}