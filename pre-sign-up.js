
export const main = async event => {

    const { response } = event;
    response.autoConfirmUser = true;
    return event;
};