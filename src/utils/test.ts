interface Product {
    id: number;
    name: string;
    price: number;
    comb: number;
    comb_name?: string;
}
const arr: Product[] = [
    {
        id: 1,
        name: 'Product A',
        price: 100,
        comb: 3,
    },
    {
        id: 2,
        name: 'Product B',
        price: 200,
        comb: 8,
    },
    {
        id: 3,
        name: 'Product C',
        price: 300,
        comb: 2,
    },
    {
        id: 4,
        name: 'Product D',
        price: 400,
        comb: 7,
    },
    {
        id: 5,
        name: 'Product E',
        price: 500,
        comb: 9,
    },
    {
        id: 6,
        name: 'Product F',
        price: 600,
        comb: 5,
    },
    {
        id: 7,
        name: 'Product G',
        price: 700,
        comb: 2,
    },
    {
        id: 8,
        name: 'Product H',
        price: 800,
        comb: 1,
    },
    {
        id: 9,
        name: 'Product I',
        price: 900,
        comb: 4,
    },
];

const getRecordProducts = (arr: Product[]): Record<number, Product> => {
    return arr.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
    }, {});
};
const getProductWithNameComb = (arr: Product[]): Product[] => {
    const recordProducts = getRecordProducts(arr);
    console.log(recordProducts);
    return arr.map((product) => {
        const comb_name = recordProducts[product.comb].name;
        return {
            ...product,
            comb_name,
        };
    });
};
const result = getProductWithNameComb(arr);
console.log(result);
