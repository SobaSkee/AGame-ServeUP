

interface RecipeIngredient {
  name: string
  amount?: string
}

export async function getUserPantry(user: any): Promise<string[] | null> {
    // console.log(user);
    if (user === null) return null; // This is fine as user is not logged in
    // TODO: Make an oops message if this fails rather than just returning an empty string
    try {
        const res = await fetch('http://localhost:3001/api/pantry/update', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        if (!res.ok) { 
            // console.log("Server encountered an error when fetching user pantry")
            return []; 
        } // Should trigger an error messge to appear

        const data = (await res.json()).ingredients as RecipeIngredient[];
        // console.log(`Fetched pantry ingredients: ${data}`)
        // TODO: include amounts
        const recipe_string: string[] = data.map(ingredient => ingredient.name);
        return recipe_string
    } 
    catch (err) {  
        // console.log("Encountered an error when fetching user pantry:")
        // if (err instanceof Error) console.log(err.message)
        return []; // Should trigger an error messge to appear
    }
}

export async function addIngredientsToUserPantry(user: any, ingredients: string[]): Promise<string[]> {
    // console.log(user);
    if (user === null) return ingredients; // Should probably give an error but whatever
    // TODO: Make an oops message if this fails rather than just returning an empty string
    const ingredients_formatted: RecipeIngredient[] = ingredients.map((ingredient) => {return {name: ingredient}})
    try {
      const res = await fetch('http://localhost:3001/api/pantry/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(ingredients_formatted)
      })

      if (!res.ok) { return ingredients; } // Should trigger an error messge to appear

      const data = (await res.json()).ingredients as RecipeIngredient[];
      // TODO: include amounts
      return data.map(ingredient => ingredient.name);
    } 
    catch {  
        return ingredients; // Should trigger an error messge to appear
    }
}

export async function addIngredientToUserPantry(user: any, ingredient: string): Promise<boolean> {
    // console.log(user);
    if (user === null) return false; // Should probably give an error but whatever
    // TODO: Make an oops message if this fails rather than just returning an empty string
    const recipe_ingredients: RecipeIngredient[] = [{name: ingredient}];
    try {
      const res = await fetch('http://localhost:3001/api/pantry/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(recipe_ingredients)
      })

      if (!res.ok) { return false; } // Should trigger an error messge to appear
      else return true;
    } 
    catch {  
        return false; // Should trigger an error messge to appear
    }
}

export async function removeIngredientsFromUserPantry(user: any, ingredients: string[]): Promise<string[]> {
    // console.log(user);
    if (user === null) return []; // Should probably give an error but whatever
    // TODO: Make an oops message if this fails rather than just returning an empty string
    const ingredients_formatted: RecipeIngredient[] = ingredients.map((ingredient) => {return {name: ingredient}})
    try {
      const res = await fetch('http://localhost:3001/api/pantry/update', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(ingredients_formatted)
      })

      if (!res.ok) { return []; } // Should trigger an error messge to appear

      const data = (await res.json()).ingredients as RecipeIngredient[];
      // TODO: include amounts
      return data.map(ingredient => ingredient.name);
    } 
    catch {  
        return []; // Should trigger an error messge to appear
    }
}

export async function removeIngredientFromUserPantry(user: any, ingredient: string): Promise<boolean> {
    // console.log(user);
    if (user === null) return false; // Should probably give an error but whatever
    // TODO: Make an oops message if this fails rather than just returning an empty string
    const recipe_ingredients: RecipeIngredient[] = [{name: ingredient}];
    try {
      const res = await fetch('http://localhost:3001/api/pantry/update', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(recipe_ingredients)
      })

      if (!res.ok) { return false; } // Should trigger an error messge to appear
      else return true;
    } 
    catch {  
        return false; // Should trigger an error messge to appear
    }
}