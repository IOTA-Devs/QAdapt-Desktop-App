export const deleteFromLocalStorage = (...keys: string[]) => {
    const items = Object.keys(localStorage);

    for (const key of keys) {
        if (items.includes(key)) {
            localStorage.removeItem(key);
        }
    }
}