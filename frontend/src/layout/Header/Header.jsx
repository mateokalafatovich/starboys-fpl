import React from 'react';
import SiteTitle from './SiteTitle';
import TabNav from './TabNav';
import './Header.css';

export default function Header() {
    return (
        <header className="main-header">
            <SiteTitle />
            <TabNav />
        </header>
    );
}