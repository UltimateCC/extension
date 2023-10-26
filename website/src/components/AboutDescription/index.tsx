import { ReactNode } from 'react';

interface AboutDescriptionProps {
    src: string;
    title: string;
    isRight: boolean;
    id: string;
    children: ReactNode;
}

function AboutDescription({ src, title, isRight, id, children }: AboutDescriptionProps) {
    return (
        <div className={`about-description ${isRight ? 'right' : ''}`} id={id}>
            <div className='about-description-text'>
                <h3>{title}</h3>
                <p>{children}</p>
            </div>
            <img src={src} alt={title} title={title} />
        </div>
    );
}

export default AboutDescription;
