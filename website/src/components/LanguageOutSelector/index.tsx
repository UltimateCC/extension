import { useState, useRef, useContext, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Alert from '../Alert/index.tsx';
import { LangList, SocketContext } from '../../context/SocketContext.tsx';

interface LanguageOutSelectorProps {
    selectedLanguageCode?: string[];
    updateConfig: (config: {translateLangs: string[]}) => Promise<void>
    configLoaded: boolean;
}

function not<T>(a: T[], b: T[]): T[] {
    return a.filter((value) => b.indexOf(value) === -1);
}

// Create a theme instance.
const theme = createTheme({
    palette: {
        secondary: {
            main: '#9F4EE5',
        },
    },
});

export default function LanguageOutSelector({ selectedLanguageCode, updateConfig, configLoaded }: LanguageOutSelectorProps) {
    const [checked, setChecked] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const searchInput = useRef<HTMLInputElement>(null);

    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    const { reloadConfig, translateLangs } = useContext(SocketContext);

    // Get lists of available and selected languages
    const [ available, selected ] = useMemo(()=>{
        const available: LangList = [];
        const selected: LangList = [];

        for(const lang of translateLangs) {
            if(selectedLanguageCode?.includes(lang.code)) {
                selected.push(lang);
            }else{
                available.push(lang);
            }
        }
        return [available, selected];

    }, [ selectedLanguageCode, translateLangs ]);

    // Search
    const searched = useMemo(()=>{
        return available.filter(lang=>lang.name.toLocaleLowerCase().includes(searchTerm));
    }, [available, searchTerm]);

    // Get lists of checked languages
    const [ availableChecked, selectedChecked ] = useMemo(()=>{
        const availableChecked: string[] = [];
        const selectedChecked: string[] = [];

        for(const code of checked) {
            if(selectedLanguageCode?.includes(code)) {
                selectedChecked.push(code);
            }else{
                availableChecked.push(code);
            }
        }
        return [availableChecked, selectedChecked];
    }, [selectedLanguageCode, checked]);

    const handleUpdateLanguages = (selectedLanguageCodes: string[]): void => {
        // Clear the search
        setSearchTerm('');

        updateConfig({
            translateLangs: selectedLanguageCodes
        })
        .then(() => {
            reloadConfig();
        })
        .catch((error) => {
            setResponse({ isSuccess: false, message: 'An error occurred while updating your languages' });
            console.error('Language update error:', error);
        });
    };

    const closeResponse = () => {
        setResponse(null);
    };

    const handleToggle = (value: string) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const handleCheckedRight = () => {
        setChecked(not(checked, availableChecked));
        handleUpdateLanguages((selectedLanguageCode??[]).concat(availableChecked));
    };

    const handleCheckedLeft = () => {
        setChecked(not(checked, selectedChecked));
        handleUpdateLanguages((selectedLanguageCode??[]).filter( code => !selectedChecked.includes(code) ) );
    };

    const customList = (items: LangList, isLeft: boolean) => (
        <Paper className={`lang-list ${isLeft ? 'left' : 'right'}`}>
            <List dense component="div" role="list" className='scroll-theme'>
                { configLoaded || isLeft ? items
                    .map((value) => {
                        const labelId = `transfer-list-item-${value.code}-label`;
                        return (
                            <ListItem key={value.code} role="listitem" button onClick={handleToggle(value.code)}>
                                <ListItemIcon>
                                    <Checkbox
                                        checked={checked.indexOf(value.code) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={value.name} />
                            </ListItem>
                        );
                    }) : (
                        <p>Loading...</p>
                    )}
            </List>
        </Paper>
    );

    return (
        <>
            {response && (
                <Alert
                    type={(response.isSuccess) ? 'success' : 'error'}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}        
            <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                className='transfer-list-container'
            >
                <Grid item className='transfer-list-side'>
                    <h4 className="language-title">Available languages</h4>
                    <ThemeProvider theme={theme}>
                        <TextField
                            inputRef={searchInput}
                            label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            color="secondary"
                            className='search-input'
                        />
                    </ThemeProvider>
                    {customList(searched, true)}
                </Grid>
                <Grid item>
                    <Grid
                        container
                        direction="column"
                        alignItems="center"
                        className="switch-btn-container"
                    >
                        <Button
                            sx={{ my: 0.5 }}
                            onClick={handleCheckedRight}
                            disabled={availableChecked.length === 0}
                            aria-label="move selected right"
                            className='switch-btn'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="18" viewBox="0 0 34 18" fill="none">
                                <path
                                    d="M34 9L19 0.339744L19 17.6603L34 9ZM1.31134e-07 10.5L20.5 10.5L20.5 7.5L-1.31134e-07 7.5L1.31134e-07 10.5Z"
                                    fill="#D9D9D9"
                                />
                            </svg>
                        </Button>
                        <Button
                            sx={{ my: 0.5 }}
                            onClick={handleCheckedLeft}
                            disabled={selectedChecked.length === 0}
                            aria-label="move selected left"
                            className='switch-btn'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="18" viewBox="0 0 34 18" fill="none">
                                <path
                                    d="M0 9L15 17.6603V0.339746L0 9ZM34 7.5L13.5 7.5V10.5L34 10.5V7.5Z"
                                    fill="#D9D9D9"
                                />
                            </svg>
                        </Button>
                    </Grid>
                </Grid>

                <Grid item className='transfer-list-side'>
                    <h4 className="language-title">Selected languages</h4>
                    {customList(selected, false)}
                </Grid>
            </Grid>
        </>
    );
}