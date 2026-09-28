function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

function createCustomFunction(callbackId, execute) {
    return {
        callbackId,
        listener: async ({inputs, client, complete, fail}) => {
            try {
                await execute({inputs, client});
            } catch (error) {
                console.error(error);
                await fail({error: errorMessage(error)});
                return;
            }

            await complete();
        }
    };
}

function createEphemeralAnnouncementFunction(callbackId, username, createBlocks, reportChannelId) {
    return createCustomFunction(callbackId, async ({inputs, client}) => {
        await client.chat.postEphemeral({
            channel: reportChannelId,
            user: inputs.user,
            username,
            blocks: createBlocks()
        });
    });
}

module.exports = {
    createCustomFunction,
    createEphemeralAnnouncementFunction
};
