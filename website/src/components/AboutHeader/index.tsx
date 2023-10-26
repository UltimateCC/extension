interface AboutHeaderProps {
    emoji: string;
    title: string;
    id: string;
}

function AboutHeader({ emoji, title, id }: AboutHeaderProps) {
    return (
        <a className='about-header' href={`#` + id}>
            <h3>{emoji}</h3>
            <h5>{title}</h5>
        </a>
    );
}

export default AboutHeader;
