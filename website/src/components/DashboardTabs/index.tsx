
interface TabProps {
    tabs: string[];
    currentTab: string;
    setCurrentTab: (tab: string)=>void;
}

function DashboardTabs({ tabs, currentTab, setCurrentTab } :TabProps) {

    return (
        <div className="tabs">
            { tabs.map(t=>
                <button
                    key={t}
                    className={`tab ${t===currentTab ? 'active' : ''}`}
                    onClick={()=>setCurrentTab(t)}>
                    {t}
                </button>
            ) }
        </div>
    );
}

export default DashboardTabs;
