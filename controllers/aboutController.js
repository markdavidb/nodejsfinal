/**
 * @file controllers/aboutController.js
 * @description Controller for the "About" page – returns information about the team members.
 */

class AboutController {
    constructor() {
        this.teamMembers = [{ first_name: 'Ofek', last_name: 'Vaknin' }, { first_name: 'Mark David', last_name: 'Boyko' }];
    }

    getAboutInfo = async (req, res) => {
        try {
            return res.json(this.teamMembers);
        } catch (error) {
            return res.status(500).json({ error: 'Server error', message: error.message });
        }
    }
}

module.exports = new AboutController();
