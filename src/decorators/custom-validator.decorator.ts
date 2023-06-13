import { Transform } from 'class-transformer';

export const Lowercase = (): PropertyDecorator => Transform(({ value }) => value.toLowerCase());
export const Capitalize = (): PropertyDecorator =>
    Transform(({ value }) =>
        value
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
    );
