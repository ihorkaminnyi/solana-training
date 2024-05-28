use anchor_lang::prelude::*;

declare_id!("EipyQKJpUMqLnuSTbVFbjYPBJedcuyU2PtaT4tn8raSZ");

#[program]
pub mod favorites {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
