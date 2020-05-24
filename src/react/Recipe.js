import React, {useEffect, useState} from "react";
import Timer from "./Timer";
import { create, all } from "mathjs";

const math = create(all, {});

function Recipe(props) {
    const recipe = props.recipe;
    const [desiredServings, setDesiredServings] = useState(recipe.servings);

    useEffect(() => {
        setDesiredServings(recipe.servings);
    }, [props.recipe]);

    const handleInputChange = (e) => setDesiredServings(e.currentTarget.value)

    const ingredients = (
        <div className={'content'}>

            <div className="field">
                <label className="label">Desired Servings</label>
                <div className="control">
                    <input className='input is-small' type='number' min={1} value={desiredServings} onChange={handleInputChange}/>
                </div>
            </div>

            {recipe.ingredients.map((ingredient) => <Ingredient key={ingredient.name} ingredient={ingredient} desiredQuantity={getDesiredQuantity(ingredient, recipe.servings, desiredServings)} />)}
        </div>
    );

    const directions = (
        <div className={'content'}>
            <ol style={{marginLeft: '16px'}}>
                {recipe.directions.map((direction) => <Direction key={direction.text} direction={direction.text} />)}
            </ol>
        </div>
    );

    return (
        <>
            <div id={'ingredients-column'} className={'column is-one-quarter'} style={{backgroundColor: '#fafafa'}}>
                <div key={recipe.name}>
                    <h3 className='subtitle'>Ingredients:</h3>
                    {ingredients}
                </div>
            </div>

            <div id={'directions-column'} className={'column'}>
                <div key={recipe.name}>
                    <h3 className={'subtitle'}>Directions:</h3>
                    {directions}
                </div>
            </div>
        </>
    );
}

// parses numbers, as well as fractions and fractions like '1 1/4'
function parseQuantity(quantity) {
    if (!isNaN(quantity))
        return quantity;

    if (quantity.indexOf(' ') !== -1) {
        const parts = quantity.split(' ');

        return parts.reduce((accumulator, part) => Number(accumulator) + math.evaluate(part));
    }

    return math.evaluate(quantity);
}

// figures out the desired quantity and formats it as a nice fraction if necessary.
function getDesiredQuantity(ingredient, defaultServings, desiredServings) {
    const ratio = desiredServings / defaultServings;
    const desiredQuantity = parseQuantity(ingredient.quantity) * ratio;

    if (desiredQuantity === 0)
        return '';

    if (desiredQuantity === Math.round(desiredQuantity))
        return desiredQuantity;
    else
    {
        let fractional = desiredQuantity;
        let nonfractional = 0;
        while (fractional > 1) {
            nonfractional++;
            fractional -= 1;
        }

        fractional = math.fraction(fractional);

        let result = getFracCode(fractional.n, fractional.d);
        if (!result)
            result = (<><sup>{fractional.n}</sup>/<sub>{fractional.d}</sub></>);

        if (nonfractional !== 0)
            result = (<>{nonfractional} {result}</>);
        return result;
    }
}

function getFracCode(n, d) {
    const codes = {
        '12': <span>&frac12;</span>,
        '13': <span>&frac13;</span>,
        '14': <span>&frac14;</span>,
        '15': <span>&frac15;</span>,
        '16': <span>&frac16;</span>,
        '18': <span>&frac18;</span>,
        '23': <span>&frac23;</span>,
        '25': <span>&frac25;</span>,
        '34': <span>&frac34;</span>,
        '35': <span>&frac35;</span>,
        '38': <span>&frac38;</span>,
        '45': <span>&frac45;</span>,
        '56': <span>&frac56;</span>,
        '58': <span>&frac58;</span>,
        '78': <span>&frac78;</span>
    };
    console.log(n + ' ' + d + ': ' + (String(n) + String(d)));
    return codes[String(n) + String(d)];
}

function Ingredient(props) {
    const ingredient = props.ingredient;
    const desiredQuantity = props.desiredQuantity;
    return (
        <div key={ingredient.name}>
            <label className="checkbox">
                <input type='checkbox' />
                <span style={{paddingLeft: '.25em'}}>
                    {desiredQuantity && desiredQuantity}
                    &nbsp;{ingredient.unit && ingredient.unit}
                    &nbsp;{ingredient.name}
                </span>
            </label>
        </div>
    );
}

function Direction(props) {
    const direction = props.direction;

    let timeAmount = extractTiming(direction);
    const timer = timeAmount > 0 ? <Timer minutes={timeAmount}/> : null;

    return (
        <li key={direction}>{direction} {timer}</li>
    );
}

function extractTiming(text) {
    const words = text.split(' ');
    const timeIndex = words.findIndex(word => word.indexOf('minute') > -1 || word.indexOf('hour') > -1);
    let timeAmount = 0;
    if (timeIndex > -1)
    {
        timeAmount = parseInt(words[timeIndex - 1], 10);
        if (isNaN(timeAmount))
            timeAmount = 0;

        let isHours = false;
        if (words[timeIndex].indexOf('hour') > -1)
            isHours = true;

        if (isHours)
            timeAmount *= 60;
    }

    return timeAmount;
}

export default Recipe;