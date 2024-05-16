
/**
 * 
 * @param keys 
 * Deletes the items from the local storage
 */
export const deleteFromLocalStorage = (...keys: string[]) => {
    const items = Object.keys(localStorage);

    for (const key of keys) {
        if (items.includes(key)) {
            localStorage.removeItem(key);
        }
    }
}

/**
 * 
 * @param date 
 * @returns Formated date as YYYY-MM-DD
 * Formats the date to YYYY-MM-DD
 */
export const getFormatedDate = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}