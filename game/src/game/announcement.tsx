import React, { ReactElement } from 'react';
import './announcement.scss';

interface AnnouncementProps {
    key?: string | number
    content: ReactElement
}

const Announcement = ({ key, content }: AnnouncementProps) => (
    <div className="Announcement" key={key}>
        <div className="Content">{content}</div>
    </div>
);

export default Announcement;