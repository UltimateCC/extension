import { useEffect, useState, useRef } from 'react';
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

import api from '../../services/api.ts';

import languageNames from '../../services/languageNames.ts';

interface LanguageOutSelectorProps {
    selectedLanguageCode: string[];
    onLanguageCodeChange: (newLanguageCode: (string)[]) => void;
    configLoaded: boolean;
}

function not<T>(a: T[], b: T[]): T[] {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection<T>(a: T[], b: T[]): T[] {
    return a.filter((value) => b.indexOf(value) !== -1);
}

// Create a theme instance.
const theme = createTheme({
    palette: {
        secondary: {
            main: '#9F4EE5',
        },
    },
});

function getCodeFromLanguage(language: string): string | undefined {
    for (const code in languageNames) {
        if (languageNames[code] === language) {
            return code;
        }
    }
    return "";
}

export default function LanguageOutSelector({ selectedLanguageCode, onLanguageCodeChange, configLoaded }: LanguageOutSelectorProps) {
    const [checked, setChecked] = useState<string[]>([]);
    const [left, setLeft] = useState<string[]>(Object.values(languageNames));
    const [right, setRight] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const searchInput = useRef<HTMLInputElement>(null);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);


    useEffect(() => {
        const selectedLanguages: string[] = [];
        const nonSelectedLanguages: string[] = [];

        for (const code in languageNames) {
            if (selectedLanguageCode.includes(code)) {
                selectedLanguages.push(languageNames[code]);
            } else {
                nonSelectedLanguages.push(languageNames[code]);
            }
        }

        setLeft(nonSelectedLanguages);
        setRight(selectedLanguages);
    }, [selectedLanguageCode]);

    const handleUpdateLanguages = (newRight: string[]): void => {
        // Clear the search
        setSearchTerm('');
        searchInput.current!.value = '';

        const selectedLanguageCodes : string[]= newRight.map((language) => {
            return getCodeFromLanguage(language) || "";
        });

        if (selectedLanguageCodes.includes("")) {
            alert('Error: one of the selected languages is invalid');
            return;
        }

        api('config', {
            method: 'POST',
            body: { translateLangs: selectedLanguageCodes }
        })
        .then((response) => {
            console.log(response);
            onLanguageCodeChange(selectedLanguageCodes);
        })
        .catch((error) => {
            console.error('Language update error:', error);
        });
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
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
        handleUpdateLanguages(right.concat(leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
        handleUpdateLanguages(not(right, rightChecked));
    };

    const customList = (items: string[], isLeft: boolean) => (
        <Paper sx={{ width: 200, height: 230 }} className={`lang-list${isLeft ? ' left' : ' right'}`}>
            <List dense component="div" role="list" className='scroll-theme'>
                {configLoaded || isLeft ? items
                    .filter((item) =>
                        isLeft ? item.toLowerCase().includes(searchTerm.toLowerCase()) : true
                    )
                    .map((value) => {
                        const labelId = `transfer-list-item-${value}-label`;

                        return (
                            <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                                <ListItemIcon>
                                    <Checkbox
                                        checked={checked.indexOf(value) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={value} />
                            </ListItem>
                        );
                    }) : (
                        <p>Loading...</p>
                    )}
            </List>
        </Paper>
    );

    return (
        <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            className='transfer-list-container'
        >
            <Grid item>
                <h4 className="language-title">Available languages</h4>
                <ThemeProvider theme={theme}>
                    <TextField
                        inputRef={searchInput}
                        label="Search"
                        sx={{ width: 200 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        color="secondary"
                        className='search-input'
                    />
                </ThemeProvider>
                {customList(left, true)}
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
                        disabled={leftChecked.length === 0}
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
                        disabled={rightChecked.length === 0}
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

            <Grid item>
                <h4 className="language-title">Selected languages</h4>
                {customList(right, false)}
            </Grid>
        </Grid>
    );
}