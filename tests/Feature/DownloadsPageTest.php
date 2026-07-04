<?php

use Inertia\Testing\AssertableInertia as Assert;

it('shows the downloads page', function () {
    $this->get('/downloads')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('downloads'));
});
