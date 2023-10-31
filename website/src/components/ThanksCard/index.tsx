
interface ThanksCardProps {
    role: string;
    username: string;
    img: string;
}

function ThanksCard({ role, username, img }: ThanksCardProps) {

    return (
        <div className="thanks-card">
            <img src={img} alt="" />
            <h4>{username}</h4>
            <p>{role}</p>
        </div>
    );
}

export default ThanksCard;