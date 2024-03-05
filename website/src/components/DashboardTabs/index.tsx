import Icons from '../Icons';

interface TabProps {
    tabs: {title: string; icon: string}[];
    currentTab: string;
    setCurrentTab: (tab: string)=>void;
}

function DashboardTabs({ tabs, currentTab, setCurrentTab } :TabProps) {
    return (
        <div className="tabs">
            { tabs.map(t=>
                <button
                    key={t.title}
                    className={`tab${t.title === currentTab ? ' active' : ''}`}
                    onClick={()=>setCurrentTab(t.title)}>
                    <Icons name={t.icon} />
                    <span>{t.title}</span>
                </button>
            ) }
        </div>
    );
}

export default DashboardTabs;
