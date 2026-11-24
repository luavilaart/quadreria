/** Optional marketing consent is never inferred from having an account. */
export function registrationInput<T extends {role:'artist'|'collector';name:string;marketing_opt_in?:boolean}>(payload:T,email=''){
 return {...payload,name:payload.name.trim()||(payload.role==='collector'?email.split('@')[0]??'':''),marketing_opt_in:payload.marketing_opt_in===true};
}