
interface TabProps {
    tabs: string[];
    currentTab: string;
    setCurrentTab: (tab: string)=>void;
}

function Tabs({ tabs, currentTab, setCurrentTab } :TabProps) {

    return (
        <div className="tabs">
            { tabs.map(t=>
                <div
                    className={`tab ${t===currentTab ? 'active' : ''}`}
                    onClick={()=>setCurrentTab(t)}>
                    {t}
                </div>
            ) }
        </div>
    );
}

export default Tabs;
